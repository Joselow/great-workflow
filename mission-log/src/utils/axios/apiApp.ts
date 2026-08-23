import { API_BASE_URL, createApi } from "../axiosCreator";

const appApi = createApi(`${API_BASE_URL}/app`)

export default appApi

