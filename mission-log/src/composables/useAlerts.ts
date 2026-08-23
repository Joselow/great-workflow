
import { useToast } from "./useToast";


const { launchToast } = useToast()

export const successToast = async (msg: string, time?: number) => {
    launchToast({ 
        msg: msg,
        time: time ?? 3000,
        css: 'bg-green-600 shadow-md',
        html: true
    })
}

export const errorToast = async (msg: string, timeValue?: number | null) => {
    let time = null

    if (timeValue != null) {
        time = 4500
    }

    launchToast({ 
        msg: msg,
        ...(time && { time }),
        css: 'bg-rose-500/90 shadow-md',
        html: true
    })
    
}