
declare let gtag: Function;

gtag('set', {'environment': 'production'});

export const environment = {
  production: true,
  apiUrl: 'https://www.services.frienbly.com',
  socket: {
    baseUrl: 'https://www.socket.frienbly.com',
    allowedOrigins: 'https://www.frienbly.com',
    opts: {}
  },
  captcha: {
    enabled: true,
    enabledOnLogin: false,
    enabledOnRegistration: false,
    expiryInMillis: 300000,
    siteKey: '6LelNjMUAAAAAHsS7Cl8NooeLBTy4uu0AcaT-Oca',
    siteSecret: '6LelNjMUAAAAADAVBD4ai8zFRBZwQuqib3yNE8Uo'
  },
  sessionStorage: {
      prefix: 'frienbly',
      storageType: 'localStorage'
  },
  csrf: {
    cookie: 'XSRF-TOKEN',
    header: 'X-XSRF-TOKEN'
  },
  auth: {
    clientId: 'frienbly',
    clientSecret: 'eb3b7f2cab9311e7abc4cec278b6b50a',
    bypassedEndpoints: [
      '/oauth/token',
      '/oauth/token/revoke',
      '/api/user/register',
      '/api/verification',
      '/api/user/forgotpassword'
    ]
  },
  googleApis: {
    mapGeocodingApi: {
      key: 'AIzaSyAbtrqa8GHtK7JfeJsfqJid44XywKbiI3c',
      url: 'https://maps.googleapis.com/maps/api/geocode/json'
    }
  },
  dialogs: {
    width: '300px'
  },
  giphy: {
    url: 'https://api.giphy.com/v1/gifs/search?api_key=',
    mpaa_rating: 'PG-13',
    api_key: 'byTJk4lVCMK4E1qYzlXlgRtQ6S8s7xUh'
  }
};
