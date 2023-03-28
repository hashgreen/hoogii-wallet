// src/SelectedAssetList.tsx

import { ICryptocurrency } from '~/types/api'
interface ISelectedAssetList {
    assets: ICryptocurrency[]
    onRemove: (id: string) => void
}

export const SelectedAssetList = ({ assets, onRemove }: ISelectedAssetList) => {
    return (
        <div className=" p-4 w-full bg-primary-100 flex flex-col    h-[300px] rounded-lg overflow-y-scroll ">
            {assets.map((asset) => (
                <div
                    key={asset.asset_id}
                    className="flex items-center justify-between w-full h-10 py-2"
                >
                    <div className="flex flex-row w-full gap-2">
                        <img
                            src={asset.icon_url}
                            alt={asset.code}
                            className="w-6 h-6"
                        />
                        <span className=" text-subtitle1 text-[#0E1F4D]">
                            {asset.code}
                        </span>
                    </div>
                    <img
                        className="cursor-pointer"
                        src="/images/icons/close-rounded.svg"
                        onClick={() => onRemove(asset.asset_id)}
                    />
                </div>
            ))}
        </div>
    )
}
