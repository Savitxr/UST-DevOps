# AWS Three-Tier Web Architecture

## 🎯 Overview

A production-grade three-tier web architecture deployed on AWS, demonstrating a highly available and scalable application infrastructure. This architecture separates concerns across three distinct tiers: presentation (web), application (business logic), and data (database), each running in isolated network layers with proper load balancing and auto-scaling capabilities.

## 📐 Architecture Description

This implementation features a hands-on deployment of a three-tier web architecture in AWS. The infrastructure includes manually configured network, security, application, and database components designed to run in a highly available and scalable manner.

### Traffic Flow
A public-facing Application Load Balancer forwards client traffic to web tier EC2 instances running Nginx webservers that serve a React.js website and redirect API calls to the application tier's internal Application Load Balancer. The internal ALB forwards traffic to the Node.js application tier, which manipulates data in an Aurora MySQL Multi-AZ database and returns results to the web tier. Load balancing, health checks, and Auto Scaling Groups are configured at each layer to maintain high availability.

## 🏗️ Architecture Components

### Web Tier (Presentation Layer)
- **Technology**: React.js 18.1.0, Nginx
- **Components**: 
  - React-based frontend application
  - Nginx web server for static content serving
  - Reverse proxy configuration for API routing
- **Deployment**: Public subnets across multiple Availability Zones
- **Load Balancing**: External Application Load Balancer
- **Features**: Health checks, auto-scaling, responsive UI

### Application Tier (Business Logic Layer)
- **Technology**: Node.js, Express.js 4.17.1
- **Components**:
  - RESTful API server (Port 4000)
  - Transaction management service
  - Database configuration module
- **Deployment**: Private subnets across multiple Availability Zones
- **Load Balancing**: Internal Application Load Balancer
- **Features**: Health checks, auto-scaling, CORS support

### Database Tier (Data Layer)
- **Technology**: Aurora MySQL Multi-AZ RDS
- **Features**:
  - Multi-AZ deployment for high availability
  - Automatic failover
  - Read replicas support
  - Automated backups
- **Security**: Deployed in private subnets, restricted security groups

## 🔧 Technology Stack

### Frontend (Web Tier)
- React 18.1.0
- React Router DOM 5.2.0
- React Scripts 5.0.1
- Styled Components 5.2.1
- Testing Library (Jest, React Testing Library)

### Backend (Application Tier)
- Node.js
- Express 4.17.1
- MySQL Driver 2.18.1
- Body Parser 1.19.0
- CORS 2.8.5
- Node Fetch 2.6.1

### Infrastructure
- Nginx (Web Server)
- AWS EC2 (Compute)
- AWS RDS Aurora MySQL (Database)
- Application Load Balancer (External & Internal)
- Auto Scaling Groups
- VPC with Multi-AZ
- NAT Gateways
- Security Groups

## 📁 Project Structure

```
3-Tier-Architecture/
├── web-tier/               # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # React source code
│   │   ├── components/     # React components
│   │   ├── assets/         # Images and resources
│   │   ├── App.js          # Main application component
│   │   └── index.js        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Web tier documentation
│
├── app-tier/               # Node.js backend API
│   ├── index.js            # Express server and routes
│   ├── DbConfig.js         # Database configuration
│   ├── TransactionService.js # Business logic
│   ├── package.json        # Backend dependencies
│   └── README.md           # App tier documentation
│
├── nginx.conf              # Nginx configuration with reverse proxy
└── README.md               # This file
```

## 📋 Prerequisites
1. An AWS account. If you don’t have an AWS account, follow the instructions [here](https://aws.amazon.com/console/) and
click on “Create an AWS Account” button in the top right corner to create one.
1. IDE or text editor of your choice.

## Architecture Overview
![Architecture Diagram](https://github.com/aws-samples/aws-three-tier-web-architecture-workshop/blob/main/application-code/web-tier/src/assets/3TierArch.png)

In this architecture, a public-facing Application Load Balancer forwards client traffic to our web tier EC2 instances. The web tier is running Nginx webservers that are configured to serve a React.js website and redirects our API calls to the application tier’s internal facing load balancer. The internal facing load balancer then forwards that traffic to the application tier, which is written in Node.js. The application tier manipulates data in an Aurora MySQL multi-AZ database and returns it to our web tier. Load balancing, health checks and autoscaling groups are created at each layer to maintain the availability of this architecture.

## Workshop Instructions:

See [AWS Three Tier Web Architecture](https://catalog.us-east-1.prod.workshops.aws/workshops/85cd2bb2-7f79-4e96-bdee-8078e469752a/en-US)


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

