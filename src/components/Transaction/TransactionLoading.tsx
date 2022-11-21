import Item from '~/components/Item'

export const TransactionLoadingItem = () => {
    return (
        <Item className="!px-3 pointer-events-none w-[100%] mb-2">
            <span className="gap-3 font-bold flex-row-center">
                <div className="skeleton rounded w-10 aspect-square"></div>
                <div className="flex flex-col justify-around h-[40px]">
                    <div className="skeleton skeleton-text w-[120px] round"></div>
                    <div className="skeleton skeleton-text w-[60px] round"></div>
                </div>
            </span>
        </Item>
    )
}

const TransactionLoading = () => {
    return (
        <>
            {[...Array(5)].map((_, index) => (
                <TransactionLoadingItem key={index} />
            ))}
        </>
    )
}

export default TransactionLoading
