import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { useEffect, useState } from 'react'
import eventBus from '../../utils/eventBus'
import useBoard from '../../store/Board'

const StatisticsChart = () => {
    const { board } = useBoard();
    const [taskCounts, setTaskCounts] = useState([]);
    const [sections] = useState([
        { title: 'TODO', color: '#30BDDC' },
        { title: 'In Progress', color: '#DC3030' },
        { title: 'Completed', color: '#30DC56' },
        { title: 'Rewise', color: '#FFC107' }
    ]);

    // Function to count tasks for each section
    const calculateTaskCounts = (board) => {
        return board.columns.map(column => ({
            name: column.title,
            count: column.cards.length
        }));
    };

    useEffect(() => {
        if (board && board.columns) {
            const sectionNames = board.columns.map(column => column.title);
            setTaskCounts(calculateTaskCounts(board).map(item => item.count));
        }
    }, [board]);

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
            formatter: function(params) {
                return `${params[0].name}: ${params[0].value} tasks`;
            }
        },
        grid: {
            left: "5%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
            show: false,
        },
        xAxis: [
            {
                type: "category",
                boundaryGap: false,
                data: sections.map(section => section.title),
                axisLabel: {
                    color: 'white',
                    fontSize: 12
                }
            }
        ],
        yAxis: [
            {
                type: "value",
                name: 'Number of Tasks',
                min: 0,
                max: function(value) {
                    return Math.max(6, Math.ceil(value.max));
                },
                interval: 1,
                axisLabel: {
                    color: 'white',
                    fontSize: 12,
                    formatter: function(value) {
                        return Math.floor(value);
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        type: 'dashed'
                    }
                },
                nameTextStyle: {
                    color: 'white',
                    fontSize: 14,
                    padding: [0, 0, 0, 40]
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