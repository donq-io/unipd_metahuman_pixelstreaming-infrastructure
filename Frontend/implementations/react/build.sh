#!/bin/bash
# Build script for Pixel Streaming React Frontend Container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="pixel-streaming-frontend"
TAG="${2:-latest}"
DOCKERFILE_PATH="Frontend/implementations/react/Dockerfile"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "Frontend/implementations/react/Dockerfile" ]; then
    log_error "Please run this script from the repository root directory"
    exit 1
fi

# Parse command line arguments
case "${1:-help}" in
    "build")
        log_info "Building Docker image: ${IMAGE_NAME}:${TAG}"
        docker build -f "${DOCKERFILE_PATH}" -t "${IMAGE_NAME}:${TAG}" . \
            --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
            --build-arg VCS_REF="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
        log_success "Image built successfully: ${IMAGE_NAME}:${TAG}"
        ;;
    
    "run")
        SIGNALLING_SERVER="${2:-ws://localhost:8888}"
        SIGNALLING_HTTP="${3:-http://localhost:8080}"
        
        log_info "Running React frontend container..."
        log_info "Signalling Server: $SIGNALLING_SERVER"
        log_info "Signalling HTTP: $SIGNALLING_HTTP"
        
        docker run -d \
            --name pixel-streaming-frontend \
            -p 3000:80 \
            -e REACT_APP_SIGNALLING_SERVER="$SIGNALLING_SERVER" \
            -e REACT_APP_SIGNALLING_HTTP="$SIGNALLING_HTTP" \
            -e DEBUG="true" \
            "${IMAGE_NAME}:${TAG}"
        log_success "Container started. Access at: http://localhost:3000"
        log_info "To view logs: $0 logs"
        log_info "To stop: $0 stop"
        ;;
    
    "stop")
        log_info "Stopping and removing container..."
        docker stop pixel-streaming-frontend 2>/dev/null || true
        docker rm pixel-streaming-frontend 2>/dev/null || true
        log_success "Container stopped and removed"
        ;;
    
    "push")
        if [ -z "$2" ]; then
            log_error "Registry URL required for push. Usage: $0 push registry.example.com [tag]"
            exit 1
        fi
        REGISTRY="$2"
        PUSH_TAG="${3:-latest}"
        FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${PUSH_TAG}"
        
        log_info "Tagging image for registry..."
        docker tag "${IMAGE_NAME}:${TAG}" "${FULL_IMAGE}"
        
        log_info "Pushing to registry: ${FULL_IMAGE}"
        docker push "${FULL_IMAGE}"
        log_success "Image pushed successfully"
        ;;
    
    "test")
        log_info "Running React frontend container tests..."
        
        # Start container for testing
        docker run -d \
            --name pixel-streaming-frontend-test \
            -p 3001:80 \
            -e REACT_APP_SIGNALLING_SERVER="ws://localhost:8888" \
            -e REACT_APP_SIGNALLING_HTTP="http://localhost:8080" \
            "${IMAGE_NAME}:${TAG}"
        
        # Wait for container to be ready
        log_info "Waiting for container to be ready..."
        sleep 15
        
        # Test health endpoint
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log_success "Health check passed"
        else
            log_error "Health check failed"
            docker logs pixel-streaming-frontend-test
            docker stop pixel-streaming-frontend-test
            docker rm pixel-streaming-frontend-test
            exit 1
        fi
        
        # Test main page
        if curl -f http://localhost:3001/ > /dev/null 2>&1; then
            log_success "Main page accessible"
        else
            log_error "Main page not accessible"
            docker logs pixel-streaming-frontend-test
            docker stop pixel-streaming-frontend-test
            docker rm pixel-streaming-frontend-test
            exit 1
        fi
        
        # Clean up
        docker stop pixel-streaming-frontend-test
        docker rm pixel-streaming-frontend-test
        log_success "All tests passed"
        ;;
    
    "clean")
        log_info "Cleaning up Docker artifacts..."
        docker stop pixel-streaming-frontend 2>/dev/null || true
        docker rm pixel-streaming-frontend 2>/dev/null || true
        docker rmi "${IMAGE_NAME}:${TAG}" 2>/dev/null || true
        docker system prune -f
        log_success "Cleanup completed"
        ;;
    
    "logs")
        log_info "Showing container logs..."
        docker logs -f pixel-streaming-frontend
        ;;
    
    "shell")
        log_info "Opening shell in container..."
        docker exec -it pixel-streaming-frontend /bin/sh
        ;;
    
    "compose")
        log_info "Starting with docker-compose..."
        cd Frontend/implementations/react
        docker-compose up --build -d
        log_success "Frontend started with docker-compose"
        log_info "Frontend: http://localhost:3000"
        log_warning "Make sure your SignallingWebServer is running separately!"
        ;;
    
    "compose-down")
        log_info "Stopping docker-compose services..."
        cd Frontend/implementations/react
        docker-compose down
        log_success "Services stopped"
        ;;
    
    "help"|*)
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  build [tag]                     Build Docker image (default: latest)"
        echo "  run [ws_url] [http_url]         Run container locally on port 3000"
        echo "  stop                            Stop and remove running container"
        echo "  push <registry> [tag]           Tag and push image to registry"
        echo "  test                            Run container tests"
        echo "  clean                           Clean up Docker artifacts"
        echo "  logs                            Show container logs"
        echo "  shell                           Open shell in running container"
        echo "  compose                         Start with docker-compose"
        echo "  compose-down                    Stop docker-compose services"
        echo "  help                            Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 build v1.0.0                Build with specific tag"
        echo "  $0 run ws://server:8888 http://server:8080  Run with custom signalling server"
        echo "  $0 push ghcr.io/user latest     Push to GitHub registry"
        echo "  $0 compose                      Start frontend (signalling server must run separately)"
        echo ""
        echo "Note: This script only handles the React frontend container."
        echo "      The SignallingWebServer must be run separately."
        ;;
esac 