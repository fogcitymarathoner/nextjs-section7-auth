'use server'
import {redirect} from "next/navigation";
import {createUser} from "@/lib/user";
import {hashUserPassword} from "@/lib/hash";
import {createAuthSession} from "@/lib/auth";

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