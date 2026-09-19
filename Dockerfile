# Build on the runner's own architecture and emit for the target one, so the
# multi-arch build does not run the whole toolchain under emulation.
FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
# The build needs the dev dependencies: the PDF, the DOCX and the OG image are
# written from src/data by scripts that run before astro build.
RUN npm ci --include=dev

COPY . .
RUN npm run build

# Installed separately from the build tree so the runtime image carries only
# what the server imports, without the compilers and exporters.
FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:24-bookworm-slim
WORKDIR /app

ENV NODE_ENV=production
# Knative routes to this port, and the container listens on every interface
# because the request arrives from the queue-proxy, not from localhost.
ENV HOST=0.0.0.0
ENV PORT=8080

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# The image ships no OpenAI key. It is injected at runtime from a Kubernetes
# Secret, so the published image stays exactly as public as the repository.
#
# Numeric, not `node`. With `runAsNonRoot: true` the kubelet has to prove the
# user is not root before starting the container, and it cannot resolve a name
# against the image's /etc/passwd — it refuses with CreateContainerConfigError.
# 1000:1000 is what `node` resolves to in this image.
USER 1000:1000

EXPOSE 8080
CMD ["node", "./dist/server/entry.mjs"]
