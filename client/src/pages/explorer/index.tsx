import { getEvents } from "@/services/events";
import { EventInfor } from "@/types/event";
import { formatGasTotal, formatTxnHash } from "@/utils/format";
import { formatEther } from "ethers";
import { Button, Dropdown, Pagination, Table, TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { FilterFilled, SearchOutlined } from "@ant-design/icons";
import { EventsName, perPages } from "@/constants/event";
import SkeletonTable from "@/components/skeleton";
import EmptyData from "@/components/empty";
const ExplorerPage = () => {
    const [data, setData] = useState<EventInfor[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(5);
    const [totalPage, setTotalPage] = useState<number | null>(null);
    const [eventFilter, setEventFilter] = useState<EventsName>(EventsName.ALL);
    const [keyword, setKeyword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const getEventsData = async (
        _keyword: string = "",
        _currentPage: number = 0,
        _perPage: number = 0
    ) => {
        try {
            setLoading(true);
            const response = await getEvents(
                _currentPage ? _currentPage : currentPage,
                _perPage ? _perPage : perPage,
                _keyword ? _keyword : keyword
            );
            if (!response.data.result) {
                throw new Error("Get events failed!");
            }
            setData(response.data.data?.events.data || []);
            setTotalPage(response.data.data?.events.meta.lastPage || null);
        } catch (error) {
            console.log(error);
            toast.error("Get events failed!");
        } finally {
            setLoading(false);
        }
    };

    const onSearch = () => {
        getEventsData();
    };

    const onResetPage = () => {
        setCurrentPage(1);
    };

    useEffect(() => {
        getEventsData();
    }, []);

    return (
        <div className="flex flex-col flex-1 bg-white rounded-md mx-20 py-4 gap-4">
            <div className="flex flex-col flex-1 w-full px-10 gap-4">
                <div className="flex flex-row w-full items-center gap-6">
                    <div className="flex flex-row items-center">
                        <img
                            src="https://flowbite-react.com/favicon.svg"
                            className="mr-3 h-6 sm:h-9"
                            alt="Flowbite React Logo"
                        />
                        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                            Market Scanner
                        </span>
                    </div>
                    <div className="flex flex-row gap-4 items-center flex-1">
                        <TextInput
                            id="keyword"
                            type="text"
                            placeholder="Search by Address / Txn Hash..."
                            className="min-w-[400px]"
                            ref={inputRef}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <Button type="button" onClick={onSearch}>
                            <SearchOutlined className="text-lg px-2" />
                        </Button>
                        <div className="ml-auto">
                            <Dropdown
                                outline
                                label={
                                    <div className="flex flex-row gap-2 items-center">
                                        <span>Event {`(${eventFilter})`}</span>
                                        <FilterFilled />
                                    </div>
                                }
                                arrowIcon={false}
                            >
                                {Object.values(EventsName).map((item) => (
                                    <Dropdown.Item
                                        key={item}
                                        className="w-[120px]"
                                        onClick={() => setEventFilter(item)}
                                    >
                                        {item}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown>
                        </div>
                    </div>
                </div>
                <div className="w-full max-h-[480px] overflow-y-auto explorer">
                    {!loading && (
                        <Table hoverable>
                            <Table.Head>
                                <Table.HeadCell>
                                    Transaction Hash
                                </Table.HeadCell>
                                <Table.HeadCell>Event</Table.HeadCell>
                                <Table.HeadCell>Block</Table.HeadCell>
                                <Table.HeadCell>Age</Table.HeadCell>
                                <Table.HeadCell>From</Table.HeadCell>
                                <Table.HeadCell>To</Table.HeadCell>
                                <Table.HeadCell>Amount</Table.HeadCell>
                                <Table.HeadCell>Txn Fee</Table.HeadCell>
                            </Table.Head>

                            <Table.Body className="divide-y">
                                {data.length > 0 &&
                                    data
                                        .filter((item) => {
                                            if (eventFilter === EventsName.ALL)
                                                return true;
                                            return item.type === eventFilter;
                                        })
                                        .map((item, index) => (
                                            <Table.Row
                                                key={index}
                                                className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <Table.Cell
                                                    className="whitespace-nowrap font-medium text-primary dark:text-white cursor-pointer"
                                                    onClick={() => {
                                                        setKeyword(
                                                            item.transactionHash
                                                        );
                                                        onResetPage();
                                                        getEventsData(
                                                            item.transactionHash,
                                                            1
                                                        );
                                                    }}
                                                >
                                                    {formatTxnHash(
                                                        item.transactionHash
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <div className="w-full px-2 py-[4px] outline outline-1 rounded-md outline-primary text-center bg-white">
                                                        {" "}
                                                        {item.type}
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {item.blockNumber}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {moment(
                                                        item.timestamp
                                                    ).fromNow()}
                                                </Table.Cell>
                                                <Table.Cell
                                                    className="text-primary cursor-pointer font-medium"
                                                    onClick={() => {
                                                        setKeyword(item.from);
                                                        onResetPage();
                                                        getEventsData(
                                                            item.from,
                                                            1
                                                        );
                                                    }}
                                                >
                                                    {formatTxnHash(item.from)}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {formatTxnHash(item.to)}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {formatEther(item.value)}{" "}
                                                    ETH
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {formatGasTotal(
                                                        item.gasTotal
                                                    )}
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                            </Table.Body>
                        </Table>
                    )}
                    {loading && <SkeletonTable />}
                    {!data.length && (
                        <div className="w-full flex flex-col items-center justify-center gap-2 mt-20">
                            <EmptyData />
                            <span className="text-gray-500 font-normal text-lg">
                                No data
                            </span>
                        </div>
                    )}
                </div>
                <div className="w-full flex flex-row justify-center items-end gap-4 mt-auto">
                    {totalPage !== null && data.length > 0 && (
                        <>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPage}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    getEventsData("", page);
                                }}
                            />
                            <Dropdown
                                label={`${perPage} / page`}
                                outline
                                size={"sm"}
                            >
                                {perPages.map((item) => (
                                    <Dropdown.Item
                                        key={item}
                                        color={"yellow"}
                                        onClick={() => {
                                            setPerPage(item);
                                            onResetPage();
                                            getEventsData("", 1, item);
                                        }}
                                    >
                                        {`${item} / page`}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExplorerPage;
