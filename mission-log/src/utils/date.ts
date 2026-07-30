import dayjs from "dayjs";
// import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es'
dayjs.locale('es')
// dayjs.extend(utc);

export const currentDate = () => {
    const today = dayjs();
    // const formattedDate =  today.format('DD/MM/YYYY');

    return today.format('YYYY-MM-DD')
}

export const formatHours = (date: string) => {
    return dayjs(date).format('DD/MM/YY h:mm:ss A')
}

export const formatDate = (date: string) => {
    const formattedDate =  dayjs(date).format('DD/MM/YY');
    return  formattedDate
}

export const formatOnlyHours = (date: string) => {
    const formattedDate =  dayjs(date).format('h:mm:ss A');
    return  formattedDate
}

// date in text
export const formatDateText = (date: string) => {
    const formattedDate = dayjs(date).format('dddd, DD [de] MMMM')
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

}

// date in text
export const formatFullDateText = (date: string) => {
    const formattedDate = dayjs(date).format('dddd DD [de] MMMM')
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

// date in iso hours, if the date dont have hours add   00:00:00
export const formatIsoHours = (date: string) => {
    
    if (!date) return null
    const formattedDate = dayjs(date).format('YYYY-MM-DDTHH:mm:ss')
    return formattedDate
}

// fin de mes
export const endOfMonth = () => {
    const today = dayjs();
    return today.endOf('month').format('YYYY-MM-DD')
}

export const dateSeparateBy = (date: string, separator = '-') => {
    const formattedDate = dayjs(date).format(`DD${separator}MM${separator}YY`)
    
    return formattedDate
}