import React, { useEffect, useState } from 'react';
import { BASE_URL } from '@/services/apis';

const YoutubeConnect = () => {
    const [authUrl, setAuthUrl] = useState(null);

    useEffect(() => {

        fetch(`${BASE_URL}/api/youtube/auth-url`)
            .then(res => res.json())
            .then(data => setAuthUrl(data.url))
            .catch(console.error);
    }, []);
    if (!authUrl) return <button disabled>Loading...</button>;

    return (
        <div>
            <a href={authUrl} className="btn btn-primary">
                Connect YouTube
            </a>
        </div>
    );
};

export default YoutubeConnect;