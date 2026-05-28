import EmployeeProfile from "@/lib/StudentProifle"

export default async function Page({params}) {
    const {id} =  await params
    console.log(id)
    return(
        <EmployeeProfile id={id}/>
    )
}