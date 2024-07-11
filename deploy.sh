#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Build the Docker image
docker build -t quizme .

# Tag the Docker image
docker tag quizme quizme.azurecr.io/quizme:v0.0.3

# Push the Docker image to the registry
docker push quizme.azurecr.io/quizme:v0.0.3

# apply the kubectl 
kubectl apply -f kubernetes/depl.yaml

# COMMIT TO GIT 
git add . && git commit -m "latest stable quizme" && git push myorigin kunledev

echo "Deployment complete"
# chmod +x deploy.sh

