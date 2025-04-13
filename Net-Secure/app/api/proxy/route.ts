export const dynamic = 'force-dynamic'; // No caching for API routes

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  
  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }
  
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'SecureShield/1.0',
      },
      cache: 'no-store',
    });
    
    const responseData = await response.text();
    
    return new Response(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(`Proxy error: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  
  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }
  
  try {
    // Clone the request to extract its content
    const requestClone = request.clone();
    const contentType = request.headers.get('Content-Type');
    let requestBody;
    
    if (contentType?.includes('application/json')) {
      requestBody = await requestClone.json();
    } else if (contentType?.includes('multipart/form-data')) {
      // For file uploads and form data
      requestBody = await requestClone.formData();
    } else {
      requestBody = await requestClone.text();
    }
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType || 'application/json',
        'User-Agent': 'SecureShield/1.0',
      },
      body: requestBody instanceof FormData ? requestBody : JSON.stringify(requestBody),
    });
    
    const responseData = await response.text();
    
    return new Response(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(`Proxy error: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}