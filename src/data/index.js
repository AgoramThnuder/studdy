import moment from "moment/moment";

// First, update the cardsData in your data file
export const cardsData = [
    {
        title: "ToDo",
        amount: 15
    },
  {
    title: "Progress",
    amount: 12,
  },
  {
    title: "Completed",
    amount: 10,
  },
  {
    title: "Rewise",
    amount: 18,
  },
];

export const ordersData = [
  {
    name: "first most task",
    items: 15,
    change: 10,
  },
  {
    name: "second most tasks",
    items: 12,
    change: 5,
  },
  {
    name: "Thrid most tasks",
    items: 8,
    change: 6,
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