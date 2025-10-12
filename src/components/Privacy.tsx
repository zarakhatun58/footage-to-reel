import React from 'react';

const Privacy = () => {
    return (
        <div>
            <h1>Privacy Policy</h1>
            <p>Last updated: October 2025</p>

            <p>
                Footage Flow (“we”, “our”, “us”) respects your privacy. This Privacy Policy explains how we handle information when you use our web app available at <a href="https://footage-to-reel.onrender.com">footage-to-reel.onrender.com</a>.
            </p>

            <h2>1. Information We Access</h2>
            <p>
                When you sign in with Google, we only request the following data:
                <ul>
                    <li>Your Google account basic profile information (name, email, and profile picture).</li>
                    <li>Read-only access to your Google Photos library (<code>https://www.googleapis.com/auth/photoslibrary.readonly</code>).</li>
                </ul>
                We use this data solely to display your own photos and personalize your experience.
            </p>

            <h2>2. How We Use Your Data</h2>
            <p>
                - We never modify, delete, or share your Google Photos.
                - We do not store or sell your personal data.
                - Access tokens are used only to fetch your photos during your active session.
            </p>

            <h2>3. Data Retention</h2>
            <p>
                We store minimal session information only as long as your session is active. You can revoke access anytime from your Google Account’s permissions page.
            </p>

            <h2>4. Sharing</h2>
            <p>
                We do not share your data with any third party.
            </p>

            <h2>5. Contact</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:zarakhatun58@gmail.com">zarakhatun58@gmail.com</a>.
            </p>

        </div>
    );
};

export default Privacy;