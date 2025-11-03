#!/bin/bash

# Multi-platform Docker image build and push script
# Builds for both linux/amd64 and linux/arm64

set -e

# Check if IMAGE_TAG is provided
if [ -z "$1" ]; then
  echo "❌ Error: IMAGE_TAG is required"
  echo "Usage: $0 <IMAGE_TAG>"
  echo "Example: $0 cbt-20251103-1"
  exit 1
fi

IMAGE_TAG=$1
IMAGE_NAME="ghcr.io/alpha3002025/dailyfeed-frontend-svc"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🚀 Building multi-platform image: ${FULL_IMAGE}"
echo "📦 Platforms: linux/amd64, linux/arm64"

# Check if buildx builder exists, if not create one
if ! docker buildx ls | grep -q multiplatform-builder; then
  echo "🔧 Creating buildx builder: multiplatform-builder"
  docker buildx create --name multiplatform-builder --use
else
  echo "✅ Using existing buildx builder: multiplatform-builder"
  docker buildx use multiplatform-builder
fi

# Inspect builder
docker buildx inspect --bootstrap

# Login to GHCR if credentials are available
if [ -n "$GITHUB_TOKEN" ] && [ -n "$GITHUB_USERNAME" ]; then
  echo "🔐 Logging in to GHCR..."
  echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin
else
  echo "⚠️  GITHUB_TOKEN or GITHUB_USERNAME not set. Make sure you're already logged in to GHCR."
fi

# Build and push multi-platform image
echo "🏗️  Building and pushing multi-platform image..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag "${FULL_IMAGE}" \
  --push \
  .

if [ $? -eq 0 ]; then
  echo "✅ Successfully built and pushed: ${FULL_IMAGE}"
  echo ""
  echo "📊 Verify the image:"
  echo "   docker manifest inspect ${FULL_IMAGE}"
  echo ""
  echo "🚀 Deploy to Kubernetes:"
  echo "   cd ../../dailyfeed-installer/dailyfeed-app-helm/frontend"
  echo "   ./install-local.sh ${IMAGE_TAG}"
else
  echo "❌ Failed to build and push image"
  exit 1
fi
