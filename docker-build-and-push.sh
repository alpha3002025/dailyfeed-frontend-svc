#!/bin/bash
# 변수 설정
IMAGE_NAME="alpha300uk/dailyfeed-frontend"
IMAGE_TAG="v0.0.13"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"


echo "📤 Image Build ..."
docker build \
  -t "${FULL_IMAGE_NAME}" \
  -f Dockerfile \
  .


# Docker 이미지 푸시
echo "📤 Docker 이미지 푸시 시작..."
docker push "${FULL_IMAGE_NAME}"

echo "✅ 이미지 푸시 완료: ${FULL_IMAGE_NAME}"