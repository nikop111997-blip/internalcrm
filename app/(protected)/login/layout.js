import { authOptions } from "@/lib/authOptions"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function LoginLayout({children}) {
    const session =  await getServerSession(authOptions)
    if(session){
        redirect('/')
    }
    return(
        <div className="w-full">
            {children}
        </div>
    )
    
}