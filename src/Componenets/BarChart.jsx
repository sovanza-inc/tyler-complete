import React from "react";

const BarChart = ({ props }) => {
  return (
    <div className="barChart">
     
      <div className="barBody">
        <div className="container">
        <div className="BarHeading">
        <h1 className="heading-text">Project Data</h1>
      </div>
          <div className="graph">
            <div className="barBody d-flex align-items-end ">
              <div className="y-axis d-flex flex-column justify-content-between">
                <div>30</div>
                <div>20</div>
                <div>10</div>
                <div>0</div>
                <div></div>
              </div>
              <div className="barGraph d-flex align-items-end  ">
                {props.map((aspect, index) => (
                  <div className="bar " key={index}>
                    <div
                      className="aspect"
                      style={{
                        height: `${aspect.height}px`,
                        backgroundColor: aspect.color,
                      }}
                    ></div>
                    <div class="label">{aspect.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChart;
