
import { useToast } from "./useToast";


const { launchToast } = useToast()

export const successToast = async (msg: string, time?: number) => {
    launchToast({ 
        msg: msg,
        time: time ?? 2500,
        css: 'bg-green-600 shadow-md',
        html: true
    })
}

export const errorToast = async (msg: string, time?: number) => {
    launchToast({ 
        msg: msg,
        time: time ?? 2500,
        css: 'bg-red-600 shadow-md',
        html: true
    })
    
}