#!/bin/bash

# Docker 이미지 빌드 및 푸시 스크립트
# 사용법: ./docker-build-and-push.sh

set -e

# 변수 설정
IMAGE_NAME="alpha300uk/dailyfeed-frontend"
IMAGE_TAG="v0.0.10"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

echo "🚀 Docker 이미지 빌드 시작..."
echo "이미지: ${FULL_IMAGE_NAME}"
echo ""
echo "ℹ️  이 이미지는 API 프록시를 사용하여 환경별 설정을 런타임에 적용합니다."
echo "   빌드 시 백엔드 URL을 지정할 필요가 없습니다."
echo ""

# Docker 이미지 빌드
# 더 이상 NEXT_PUBLIC_ 변수를 빌드 인자로 전달하지 않음
# 모든 API 호출은 /api/proxy를 통해 이루어지며, 런타임에 환경 변수로 백엔드 URL을 설정
docker build \
  -t "${FULL_IMAGE_NAME}" \
  -f Dockerfile \
  .

echo "✅ 이미지 빌드 완료"

# Docker 이미지 푸시
echo "📤 Docker 이미지 푸시 시작..."
docker push "${FULL_IMAGE_NAME}"

echo "✅ 이미지 푸시 완료: ${FULL_IMAGE_NAME}"
echo ""
echo "다음 단계:"
echo "1. K8s ConfigMap에서 서버 사이드 환경 변수 설정:"
echo "   - MEMBER_SERVICE_URL"
echo "   - CONTENT_SERVICE_URL"
echo "   - TIMELINE_SERVICE_URL"
echo "   - ACTIVITY_SERVICE_URL"
echo "   - IMAGE_SERVICE_URL"
echo "   - SEARCH_SERVICE_URL"
echo ""
echo "2. Deployment를 업데이트하여 새 이미지 적용:"
echo "   kubectl set image deployment/dailyfeed-frontend dailyfeed-frontend=${FULL_IMAGE_NAME} -n dailyfeed"
