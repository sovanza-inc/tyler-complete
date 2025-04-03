import React from 'react'

const RecentActivity = ({ recentAct }) => {
  const { recentActDes } = recentAct;
  
  return (
    <div className="ActdecList">
      <div className="recentHeading">
        <h1  className="heading-text">Recent Activities</h1>
      </div>
      <div>
        {recentActDes.map((recentAct, index) => (
          <div className="act-box" key={index}>
            <div className="act-des-box1 d-flex flex-wrap">
              <div className="actImg">
                <img src="/img/act-1.png" alt="Activity" />
              </div>
              <div className="actdetail">
                <div className="actTitle">
                  <h2>{recentAct.head}</h2>
                </div>
                <div className="actDes">
                  <h4>{recentAct.des}</h4>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
