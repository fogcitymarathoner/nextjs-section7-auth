'use server'
import {redirect} from "next/navigation";
import {createUser} from "@/lib/user";
import {hashUserPassword, verifyPassword} from "@/lib/hash";
import {createAuthSession, destroySession} from "@/lib/auth";
import {getUserByEmail} from "@/lib/user";

export async function signup(prevState, formData) {
    const email = formData.get('email')
    const password = formData.get('password')
    console.log('signup()')
    console.log('email ' + email)
    console.log('password ' + password)
    let errors = {}
    if (!email.includes('@')) {
        errors.email = "Please enter a valid email"
    }

    if (password.trim().length < 8) {
        errors.password = "Password must be at least 8 characters"
    }
    if (Object.keys(errors).length > 0) {
        return {
            errors,
        }
    }
    const hashedPassword = hashUserPassword(password)
    try {
        const userId = createUser(email, hashedPassword)
        console.log('userId ' + userId);
        await createAuthSession(userId)
        redirect('/training')
    } catch (error) {
        console.log('error.code ' + error.code)
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return {
                errors: ['It seems like an account for the chosen email already exists.']
            }
        }
        throw error
    }

}

export async function login(prevState, formData) {
    const email = formData.get('email')
    const password = formData.get('password')
    console.log('login()')
    console.log('email ' + email)
    console.log('password ' + password)
    const existingUser = getUserByEmail(email)
    if (!existingUser) {
        return {
            errors: {
                email: 'Could not authenticate user, please check your credentials.'
            }
        }
    }
    const verifiedPassword = await verifyPassword(existingUser.password, password)
    if (!verifiedPassword) {
        return {
            errors: {
                email: 'Could not authenticate user, please check your credentials.'
            }
        }
    }
    console.log('existingUser.UserId ' + existingUser.id)
    await createAuthSession(existingUser.id)
    console.log("redirect('/training')")
    redirect('/training')

}

export async function auth(mode, prevState, formData) {
    if (mode === 'login') {
        return login(prevState, formData)
    }
    return signup(prevState, formData)
}

export async function logout(){
    console.log('(logout) destroySession()')
    await destroySession()

    console.log("redirect('/')")
    redirect('/')
}