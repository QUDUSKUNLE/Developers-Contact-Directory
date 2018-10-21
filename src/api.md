> API documentation

  - Developer Signup
    - [POST] /api/v1/signup
    - Body
      ```
        {
          'email': 'kola@mail.com',
          'username': 'kola',
          'password': '1234567yu',
          'confirmPassword': '123456yu'
        }
      ```

  - Developer Signin
    - [POST] /api/v1/signin
    - Body
      ```
        {
          'email': 'kola@mail.com',
          'password: '1234567yu'
        }
      ```

  - Update Developer Profile
    - [PUT] /api/v1/profiles
    - [HEADERS] `x-access-token: token`
    - Body
      ```
        {
          'username': 'kola',
          'address': '10, Jakande Street, Ilupeju, Lagos',
          'loaction': 'Lagos',
          'developer': 'Fullstack Developer',
          'stack': 'Python/Django'
        }
      ```

  - Query Developer Details
    - [GET] /api/v1/developer/:id
    - params {id} - Developer identity
      > value - {String}


  - Search for Developers
    - [GET] /api/v1/developers?developers=Backend Developer&offset=0&limit=10
    - query {developers}
      > Frontend Developer

      > Backend Developer

      > Fullstack Developer
    - offset
      > value {int}
    - limit
      > value {int}
  
  - Reset Developer Password
    - [POST] /api/v1/passwords
    - Body
      ```
        {
          'password': 'kola@mail.com'
        }
      ```

  - Delete Developer Account
    - [DELETE] /api/v1/developers/:id
    - [HEADERS] `x-access-token: token`