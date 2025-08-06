nstructions for the Developer
Here's the plan to modify your GitHub Actions workflow to use S3 instead of GitHub's artifact storage:

Use the existing S3 bucket: We'll use a new subfolder (artifacts/) within your existing pho-near-me-static bucket to temporarily store build artifacts.
Key changes to implement:

Add AWS credential configuration to the build job
Upload build artifacts directly to S3 instead of using GitHub's artifact storage
Download artifacts from S3 in both deploy and preview jobs
Add cleanup steps to remove the temporary artifacts when jobs complete


Issues this will fix:

Eliminates the GitHub Actions artifact storage quota issue
Provides more control over artifact storage and cleanup
Simplifies the workflow by using S3 for both temporary artifacts and final deployment


Implementation notes:

The workflow uses a unique path for each build based on github.run_id and github.run_attempt
Cleanup steps run even if jobs fail (using the if: always() condition)
We're using the same S3 bucket you already have, just adding an artifacts/ prefix


Lifecycle of artifacts:

Created during the build step
Used by deploy or preview jobs
Automatically deleted when jobs complete (even if they fail)



