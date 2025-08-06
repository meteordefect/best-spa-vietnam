# AWS Deployment Playbook for "Pho Near Me" Static Site

This playbook outlines the process for deploying the "Pho Near Me" Next.js static site to AWS S3 and CloudFront for optimal performance and cost efficiency.

## Overview

Our deployment strategy leverages:
- **S3**: For hosting static files
- **CloudFront**: As a CDN for global distribution and HTTPS
- **Route 53**: For domain management (optional)
- **AWS CLI**: For automated deployments

This approach is tailored for our static site generation process that uses:
- Next.js static export
- Custom static page generation script
- Pre-generated map images

## Prerequisites

1. AWS account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js and npm installed
4. Git repository with your project

## Step 1: Set Up S3 Bucket

1. **Create an S3 bucket**:
   ```bash
   aws s3 mb s3://phonearme-website --region ap-southeast-2
   ```

2. **Configure the bucket for static website hosting**:
   ```bash
   aws s3 website s3://phonearme-website --index-document index.html --error-document 404.html
   ```

3. **Create and attach a bucket policy for public access**:
   Create a file named `bucket-policy.json`:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::phonearme-website/*"
       }
     ]
   }
   ```

   Apply the policy:
   ```bash
   aws s3api put-bucket-policy --bucket phonearme-website --policy file://bucket-policy.json
   ```

## Step 2: Build and Export the Static Site

1. **Update next.config.ts** to ensure proper static export:
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
     trailingSlash: true,
   };

   export default nextConfig;
   ```

2. **Create a build script** in `scripts/build-for-aws.js`:
   ```javascript
   const { execSync } = require('child_process');
   const fs = require('fs');
   const path = require('path');

   // Ensure the out directory exists and is empty
   const outDir = path.join(__dirname, '..', 'out');
   if (fs.existsSync(outDir)) {
     fs.rmSync(outDir, { recursive: true, force: true });
   }
   fs.mkdirSync(outDir, { recursive: true });

   console.log('🔄 Running data scraping script...');
   execSync('npm run scrape-data', { stdio: 'inherit' });

   console.log('🔄 Generating static pages...');
   execSync('npm run generate-pages', { stdio: 'inherit' });

   console.log('🔄 Building Next.js static site...');
   execSync('next build', { stdio: 'inherit' });

   console.log('✅ Build complete! Static site is ready in the "out" directory.');
   ```

3. **Add the script to package.json**:
   ```json
   "scripts": {
     "build:aws": "node scripts/build-for-aws.js",
     "deploy:aws": "aws s3 sync out/ s3://phonearme-website --delete"
   }
   ```

4. **Run the build script**:
   ```bash
   npm run build:aws
   ```

## Step 3: Deploy to S3

1. **Deploy the static site to S3**:
   ```bash
   npm run deploy:aws
   ```

   This will sync the `out` directory with your S3 bucket, uploading new files, updating changed files, and removing deleted files.

## Step 4: Set Up CloudFront

1. **Create a CloudFront distribution**:
   ```bash
   aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
   ```

   Create a file named `cloudfront-config.json`:
   ```json
   {
     "CallerReference": "phonearme-website-1",
     "Aliases": {
       "Quantity": 1,
       "Items": ["phonearme.net"]
     },
     "DefaultRootObject": "index.html",
     "Origins": {
       "Quantity": 1,
       "Items": [
         {
           "Id": "S3-phonearme-website",
           "DomainName": "phonearme-website.s3-website-ap-southeast-2.amazonaws.com",
           "CustomOriginConfig": {
             "HTTPPort": 80,
             "HTTPSPort": 443,
             "OriginProtocolPolicy": "http-only",
             "OriginSslProtocols": {
               "Quantity": 1,
               "Items": ["TLSv1.2"]
             },
             "OriginReadTimeout": 30,
             "OriginKeepaliveTimeout": 5
           }
         }
       ]
     },
     "DefaultCacheBehavior": {
       "TargetOriginId": "S3-phonearme-website",
       "ViewerProtocolPolicy": "redirect-to-https",
       "AllowedMethods": {
         "Quantity": 2,
         "Items": ["GET", "HEAD"],
         "CachedMethods": {
           "Quantity": 2,
           "Items": ["GET", "HEAD"]
         }
       },
       "Compress": true,
       "DefaultTTL": 86400,
       "MinTTL": 0,
       "MaxTTL": 31536000,
       "ForwardedValues": {
         "QueryString": false,
         "Cookies": {
           "Forward": "none"
         },
         "Headers": {
           "Quantity": 0
         },
         "QueryStringCacheKeys": {
           "Quantity": 0
         }
       }
     },
     "CustomErrorResponses": {
       "Quantity": 1,
       "Items": [
         {
           "ErrorCode": 404,
           "ResponsePagePath": "/404.html",
           "ResponseCode": "404",
           "ErrorCachingMinTTL": 300
         }
       ]
     },
     "Comment": "Pho Near Me Website",
     "Enabled": true,
     "PriceClass": "PriceClass_All"
   }
   ```

2. **Get the CloudFront distribution ID and domain name**:
   ```bash
   aws cloudfront list-distributions
   ```

   Note the `Id` and `DomainName` values for your distribution.

## Step 5: Set Up Custom Domain (Optional)

1. **Create a hosted zone in Route 53** (if you don't already have one):
   ```bash
   aws route53 create-hosted-zone --name phonearme.net --caller-reference phonearme-1
   ```

2. **Create an SSL certificate in ACM**:
   ```bash
   aws acm request-certificate --domain-name phonearme.net --validation-method DNS --region us-east-1
   ```

   Note: CloudFront requires certificates to be in the us-east-1 region.

3. **Add the certificate to your CloudFront distribution**:
   ```bash
   aws cloudfront update-distribution --id YOUR_DISTRIBUTION_ID --distribution-config file://cloudfront-ssl-config.json
   ```

   Create a modified version of your CloudFront config that includes the SSL certificate ARN.

4. **Create a Route 53 record to point to CloudFront**:
   ```bash
   aws route53 change-resource-record-sets --hosted-zone-id YOUR_HOSTED_ZONE_ID --change-batch file://route53-record.json
   ```

   Create a file named `route53-record.json`:
   ```json
   {
     "Changes": [
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "phonearme.net",
           "Type": "A",
           "AliasTarget": {
             "HostedZoneId": "Z2FDTNDATAQYW2",
             "DNSName": "YOUR_CLOUDFRONT_DOMAIN_NAME",
             "EvaluateTargetHealth": false
           }
         }
       }
     ]
   }
   ```

   Note: `Z2FDTNDATAQYW2` is the fixed hosted zone ID for CloudFront distributions.

## Step 6: Set Up GitHub Actions Deployment

1. **Configure GitHub Actions Secrets**:
   Go to your GitHub repository settings > Secrets and Variables > Actions and add:
   ```
   AWS_ROLE_ARN: arn:aws:iam::<account-id>:role/github-actions-role
   CLOUDFRONT_DISTRIBUTION_ID: <your-distribution-id>
   ```

2. **Create IAM Role for GitHub Actions**:
   Create a role with the following permissions:
   - s3:PutObject
   - s3:DeleteObject
   - s3:ListBucket
   - cloudfront:CreateInvalidation

3. **Configure OIDC in AWS**:
   Set up OpenID Connect between GitHub and AWS to allow secure authentication.
   Follow GitHub's guide: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services

4. **Local Deployment Script** (optional backup method):
   Create a deployment script in `scripts/deploy-to-aws.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the build script first
console.log('🔄 Building the static site...');
execSync('npm run build:aws', { stdio: 'inherit' });

// Deploy to S3
console.log('🔄 Deploying to S3...');
execSync('aws s3 sync out/ s3://phonearme-website --delete', { stdio: 'inherit' });

// Create CloudFront invalidation to clear cache
console.log('🔄 Creating CloudFront invalidation...');
execSync(
  'aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"',
  { stdio: 'inherit' }
);

console.log('✅ Deployment complete! The site should be live in a few minutes.');
```

Add to package.json:
```json
"scripts": {
  "deploy": "node scripts/deploy-to-aws.js"
}
```

## Step 7: Optimize for Performance

1. **Configure proper caching headers**:
   ```bash
   aws s3 sync out/ s3://phonearme-website --delete --cache-control "max-age=31536000,public" --exclude "*.html" --exclude "index.html" --exclude "404.html"
   aws s3 sync out/ s3://phonearme-website --delete --cache-control "max-age=0,no-cache,no-store,must-revalidate" --include "*.html" --include "index.html" --include "404.html"
   ```

   This sets long cache times for static assets and no caching for HTML files.

2. **Enable compression in CloudFront** (already included in the config above).

3. **Map images**:
   Map images are stored in GitHub and are already optimized (around 57KB each). No additional compression is needed.

## Step 8: Monitor and Maintain

1. **Set up CloudWatch alarms** for S3 and CloudFront metrics.

2. **Create a maintenance script** to check for broken links and missing resources.

3. **Implement a rollback strategy** by versioning your deployments.

## Troubleshooting

### Common Issues

1. **404 errors for pages**: Ensure your CloudFront distribution has the correct origin path and that the default root object is set to `index.html`.

2. **Missing images or assets**: Check that all file paths in your HTML are correct and that the files exist in the S3 bucket.

3. **Slow initial load**: Verify that CloudFront is properly configured and that you're using the CloudFront domain name or your custom domain.

4. **CORS issues**: Add appropriate CORS headers to your S3 bucket if you're loading resources from other domains.

### Debugging Steps

1. **Check S3 bucket contents**:
   ```bash
   aws s3 ls s3://phonearme-website --recursive
   ```

2. **Verify CloudFront distribution status**:
   ```bash
   aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
   ```

3. **Test S3 website endpoint directly**:
   ```
   http://phonearme-website.s3-website-ap-southeast-2.amazonaws.com/
   ```

## Cost Optimization

1. **S3 Intelligent-Tiering**: Consider enabling for infrequently accessed files.

2. **CloudFront Price Class**: Use `PriceClass_100` if you only need distribution in North America and Europe.

3. **Request Consolidation**: Combine small CSS/JS files to reduce the number of requests.

## Security Considerations

1. **Bucket Policy**: Ensure your S3 bucket policy only allows the necessary permissions.

2. **CloudFront OAI**: Consider using Origin Access Identity for added security.

3. **HTTPS**: Enforce HTTPS for all traffic through CloudFront.

4. **Access Logs**: Enable access logging for both S3 and CloudFront.

## Conclusion

This deployment strategy provides a high-performance, cost-effective solution for hosting the "Pho Near Me" static website. By leveraging AWS S3 for storage and CloudFront for content delivery, we achieve global distribution with minimal latency.

The approach is particularly well-suited for our static site generation process, which pre-renders all pages and assets during the build phase. This eliminates the need for server-side rendering at runtime, resulting in faster page loads and improved user experience.

Remember to replace placeholder values (like `YOUR_DISTRIBUTION_ID`) with your actual AWS resource identifiers.
