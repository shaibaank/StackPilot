import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8000/auth",
    withCredentials: true
})



export async function register (username,email,password) {
    try {
        const response = await api.post('/register', {
            username,
            email,
            password

        })
        return response.data
    } catch (err) {
        throw err
  }
}

export async function login(email, password) {
    try {
        const response = await api.post('/login', {
            email,
            password
        })
        return response.data
    } catch (err) {
        throw err
    }
}
export async function getUserDetails() {
    try {
        const response = await api.get('/get-me')
        return response.data
    } catch (err) {
        throw err
      }
}

export async function logout() {
    try {
        const response = await api.post('/logout')
    return response.data
    } catch (err) {
        throw err
    }
}