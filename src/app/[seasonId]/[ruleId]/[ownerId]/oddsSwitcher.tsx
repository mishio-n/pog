"use client";

import { useOddsSwitch } from "./oddsSwitchProvider";

export const OddsSwitcher: React.FC = () => {
  const { isShowTotalPoint, toggle } = useOddsSwitch();

  return (
    <div className="form-control items-start px-2">
      <label className="label cursor-pointer">
        <span className="label-text text-sm">オッズ計算後を表示する</span>
        <input
          type="checkbox"
          className="toggle-accent toggle ml-8"
          checked={isShowTotalPoint}
          onChange={() => toggle()}
        />
      </label>
    </div>
  );
};
