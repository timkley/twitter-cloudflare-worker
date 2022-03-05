addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
    const cache = caches.default
    const oauthToken = await getOauthToken()

    let response = await cache.match(event.request)
    if (response) {
        return response
    }

    const twitterResponse = await (await fetch(
        'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=timkley&count=1',
        {
            headers: {
                Authorization: `Bearer ${oauthToken}`,
            },
        },
    )).json()

    response = new Response(JSON.stringify(twitterResponse[0]), {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'max-age: 300',
        },
    })

    event.waitUntil(cache.put(event.request, response.clone()))

    return response
}

async function getOauthToken() {
    const basicAuth = btoa(`${TWITTER_API_KEY}:${TWITTER_API_SECRET}`)

    const response = await fetch('https://api.twitter.com/oauth2/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: 'grant_type=client_credentials',
    })

    const json = await response.json()

    return json['access_token']
}
