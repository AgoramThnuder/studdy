import moment from "moment/moment";

export const cardsData = [
  {
    title: "Revenue",
    change: 24,
    amount: 42056,
  },
  {
    title: "Orders",
    change: -14,
    amount: 52125.03,
  },
  {
    title: "Expenses",
    change: 18,
    amount: 1216.5,
  },
  {
    title: "Profit",
    change: 12,
    amount: 10125.0,
  },
];

export const ordersData = [
  {
    name: "Skatebnoard",
    type: "Illustration",
    items: 58,
    change: 290,
  },
  {
    name: "Language courses",
    type: "Illustration",
    items: 12,
    change: 72
  },
  {
    name: "Office Collaboration",
    type: "Illustration",
    items: 7,
    change: 70
  },
  {
    name: "Robot",
    type: "Illustration",
    items: 21,
    change: 15
  }
]


//* get the value in group number format
export const groupNumber = (number) => {
  return parseFloat(number.toFixed(2)).toLocaleString("en", {
    useGrouping: true,
  });
};


//* calendar Events
let eventGuid = 0
let todayStr = moment().format("YYYY-MM-DD")  // YYYY-MM-DD of today
export const INITIAL_EVENTS = [
{}
]

export function createEventId() {
  return String(eventGuid++)
}


// * tasks
export const boardData = {
    columns: [
        {
            id: 1,
            title: "TODO",
            cards: []
        },
        {
            id: 2,
            title: "Doing",
            cards: []
        },
        {
            id: 3,
            title: "Completed",
            cards: []
        },
        {
            id: 4,
            title: "Rewise",
            cards: []
        }
    ]
}


// * user table data
export const userData = [];

export const sidebarData = [
  {
    icon: "home",
    heading: "Dashboard",
    path: "/"
  },
  {

    heading: "Users",
    path: "/users"
  },
  {
    icon: "login",  // Make sure this matches a valid Material Icon name
    heading: "Login",
    path: "/login"
  }
  // ... any other existing routes
];