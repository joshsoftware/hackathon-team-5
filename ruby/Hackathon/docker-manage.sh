#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored output
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_message $RED "Error: Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Build and start containers
start() {
    print_message $YELLOW "Building and starting containers..."
    docker-compose build
    docker-compose up -d
    print_message $GREEN "Containers are up and running!"
}

# Stop containers
stop() {
    print_message $YELLOW "Stopping containers..."
    docker-compose down
    print_message $GREEN "Containers stopped successfully!"
}

# Restart containers
restart() {
    print_message $YELLOW "Restarting containers..."
    docker-compose down
    docker-compose up -d
    print_message $GREEN "Containers restarted successfully!"
}

# Show container logs
logs() {
    print_message $YELLOW "Showing container logs..."
    docker-compose logs -f
}

# Show running containers
status() {
    print_message $YELLOW "Current container status:"
    docker-compose ps
}

# Clean up Docker resources
cleanup() {
    print_message $YELLOW "Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    print_message $GREEN "Cleanup completed!"
}

# Run Rails commands inside the container
rails_command() {
    print_message $YELLOW "Running Rails command: $1"
    docker-compose run --rm web bundle exec $1
}

# Show help message
show_help() {
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  start     - Build and start containers"
    echo "  stop      - Stop containers"
    echo "  restart   - Restart containers"
    echo "  logs      - Show container logs"
    echo "  status    - Show container status"
    echo "  cleanup   - Clean up Docker resources"
    echo "  console   - Run Rails console"
    echo "  migrate   - Run database migrations"
    echo "  help      - Show this help message"
}

# Check if Docker is running
check_docker

# Parse command line arguments
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    cleanup)
        cleanup
        ;;
    console)
        rails_command "rails console"
        ;;
    migrate)
        rails_command "rails db:migrate"
        ;;
    help)
        show_help
        ;;
    *)
        print_message $RED "Unknown command: $1"
        show_help
        exit 1
        ;;
esac