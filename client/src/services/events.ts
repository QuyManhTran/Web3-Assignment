import { request } from "@/configs/axios";
import { GetEVents } from "@/types/base";

export const getEvents = async (
    curPage: number = 1,
    perPage: number = 10,
    keyword: string = ""
) => {
    return request.get<GetEVents>(`/events`, {
        params: {
            per_page: perPage,
            cur_page: curPage,
            keyword,
        },
    });
};
