#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Build the Docker image
docker build -t quizme .

# Tag the Docker image
docker tag quizme quizme.azurecr.io/quizme:v0.0.0

# Push the Docker image to the registry
docker push quizme.azurecr.io/quizme:v0.0.0

# apply the kubectl 
kubectl apply -f kubernetes/depl.yaml

# COMMIT TO GIT 
git add . && git commit -m "testing azure kubernetes service" && git push myorigin kunledev

echo "Deployment complete"
# chmod +x deploy.sh

