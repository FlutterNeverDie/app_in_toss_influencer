#!/bin/bash

# 사용법: ./deploy.sh "배포 내용 메모"

echo "⏳ 빌드 중..."
npx granite build

echo "🚀 배포 중..."
# 배포 실행 및 결과 캡처
OUTPUT=$(npx ait deploy 2>&1)

# 결과 화면 출력
echo "$OUTPUT"
