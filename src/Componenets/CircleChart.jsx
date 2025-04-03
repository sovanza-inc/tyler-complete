import React from 'react'

const CircleChart = ({data }) => {
    const { Circle1, Circle2, Circle3 } = data;
     
    
    const deg1 = Circle1.percentage*3.6;
    const deg2 = Circle2.percentage*3.6;
    const deg3 = Circle3.percentage*3.6;
    const circleData = Object.keys(data).map((key) => ({
        ...data[key] 
      }));
  return (
    <div className="CircularProg">
                    <div className="circularBar"><div className="CirBarHead">
                      <h3  className="heading-text">Cost Breakdown</h3>
                    </div>
                      <div className="mainCircle d-flex flex-column align-items-center ">
                        <div className="circleChart d-flex align-items-center justify-content-center" style={{background: `conic-gradient(${Circle1.color} ${deg1}deg, #e9ebf3 0deg)` }}>
                          <div className="smallcircle1 d-flex  align-items-center justify-content-center" style={{background: `conic-gradient(${Circle2.color} ${deg2}deg, #e9ebf3 0deg)` }}>
                            <div className="smallcircle2 d-flex align-items-center justify-content-center" style={{background: `conic-gradient(${Circle3.color} ${deg3}deg, #e9ebf3 0deg)` }}>


                            </div>
                          </div>

                        </div>


                      </div>
                      <div className="CircleInfo d-flex flex-column align-items-center">
                      <div className="circleDetail d-flex justify-content-betweeen flex-wrap">
                 
                      
                               {circleData.map((circle, index) => (
              <div className="cost-item " key={index}>
                <div className='d-flex align-items-center '>       
                         <span className={`dot dot-${index + 1}` } style={{ borderColor: circle.color }}>           
                </span>
               <div> {circle.name}</div>
               </div>

                <div className="cost-value">${circle.value.toFixed(2)}</div>
              </div>
            ))}
                        </div>
                      </div>
                    </div>
                  </div>
  )
}

export default CircleChart