import React from 'react'
import { groupNumber, ordersData } from '../../data'
import OrdersPieChart from '../OrdersPieChart/OrdersPieChart'
import css from './Orders.module.css'

const Orders = () => {
  return (
    <div className={`${css.container} theme-container`}>
      <div className={css.head}>
        <h2>Study Buddy</h2>
      </div>

      <div className={`grey-container ${css.stat}`}>
        <span>Completed Tasks</span>
        <span>{groupNumber(45)}</span>
      </div>

      <div className={css.orders}>
        {
          ordersData.map((order, index) => (
            <div key={index} className={css.order}>
              <div>
                <span>{order.name}</span>
                <span>{order.change}</span>
              </div>
              <div>
                <span>{order.type}</span>
              </div>
            </div>
          ))
        }
      </div>

      <div className={css.orderChart}>
        <span>Split by tasks</span>
        <OrdersPieChart/>
      </div>
    </div>
  )
}

export default Orders