import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { useEffect, useState } from 'react'
import eventBus from '../../utils/eventBus'

const StatisticsChart = () => {
    const [subjects, setSubjects] = useState([]);
    const [taskCounts, setTaskCounts] = useState([]);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        const userSubjects = userInfo.subjects?.map(subject => subject.name) || [];
        setSubjects(userSubjects);
        setTaskCounts(new Array(userSubjects.length).fill(0)); // Initialize with zeros
    }, []);

    useEffect(() => {
        const unsubscribe = eventBus.subscribe('subjectsUpdated', (updatedSubjects) => {
            const subjectNames = updatedSubjects.map(subject => subject.name);
            setSubjects(subjectNames);
            setTaskCounts(new Array(subjectNames.length).fill(0));
        });
        
        return () => unsubscribe();
    }, []);

    const option = {
        color: ['var(--orange)'],
        toolbox: {
            feature: {
                saveAsImage: {},
            }
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross"
            },
            backgroundColor: "rgba(0, 0, 0, 0.59)",
            borderWidth: 0,
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
            show: false,
        },
        xAxis: [
            {
                type: "category",
                boundaryGap: false,
                data: subjects,
                axisLabel: {
                    color: 'white'
                }
            }
        ],
        yAxis: [
            {
                type: "value",
                name: 'Number of Tasks',
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    color: 'white'
                }
            }
        ],
        series: [
            {
                type: "line",
                smooth: true,
                lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: "rgb(255, 191, 0)",
                        },
                        {
                            offset: 1,
                            color: "#F450D3"
                        }
                    ]),
                    width: 4
                },
                areaStyle: {
                    opacity: .5,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 0.8, [
                        {
                            offset: 0,
                            color: "#FE4C00"
                        },
                        {
                            offset: 1,
                            color: "rgba(255,144,70,0.1)"
                        }
                    ])
                },
                emphasis: {
                    focus: "series",
                },
                showSymbol: false,
                data: taskCounts
            }
        ]
    }

    return (
        <ReactECharts option={option} style={{ height: '400px' }}/>
    )
}

export default StatisticsChart