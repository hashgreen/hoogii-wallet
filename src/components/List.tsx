// src/SelectedAssetList.tsx

import { Asset } from '~/types/entities'
interface ISelectedAssetList {
    assets: Asset[]
    onRemove: (id: string) => void
}

export const SelectedAssetList = ({ assets, onRemove }: ISelectedAssetList) => {
    return (
        <div className=" p-4 w-full bg-primary-100 flex flex-col    h-[300px] rounded-lg overflow-y-scroll ">
            {assets.map((asset) => (
                <div
                    key={asset.assetId}
                    id={asset.assetId}
                    className="flex items-center justify-between w-full h-10 py-2"
                >
                    <div className="flex flex-row w-full gap-2">
                        <img
                            src={asset.icon}
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
                        onClick={() => onRemove(asset.assetId)}
                    />
                </div>
            ))}
        </div>
    )
}
