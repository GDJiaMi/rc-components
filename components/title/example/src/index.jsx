import React from "react";
import ReactDOM from "react-dom";
import { Router, Switch } from "react-router";
import { Link, HashRouter } from "react-router-dom";
import { Icon, Dropdown } from "antd";
import { Title, AdminLayout, BackBar, Route } from "@gdjiami/rc-components";
import "antd/dist/antd.css";
import "@gdjiami/rc-components/lib/title/style/css";
import "@gdjiami/rc-components/lib/admin-layout/style/css";
import "@gdjiami/rc-components/lib/back-bar/style/css";
import "./styles.css";

const menus = [
  {
    title: "Dashboard",
    path: "/"
  },
  {
    title: "订单",
    path: "/orders"
  }
];

class App extends React.Component {
  render() {
    return (
      <HashRouter>
        <Title.Provider debug>
          <AdminLayout
            siteName="example"
            title={
              <Title.Display
                breadcrumb
                style={{ display: "inline", fontSize: "16px" }}
              />
            }
            menus={menus}
            after={
              <React.Fragment>
                <AdminLayout.Action>
                  <Icon type="search" />
                </AdminLayout.Action>
                <AdminLayout.Action>
                  <Icon type="question" />
                </AdminLayout.Action>
                <Dropdown overlay={<div>dropdown</div>}>
                  <AdminLayout.Action>管理员</AdminLayout.Action>
                </Dropdown>
              </React.Fragment>
            }
          >
            <AdminLayout.View>
              <Title link="/">首页</Title>
              <Switch>
                <Route
                  path="/"
                  exact
                  // @ts-ignore
                  component={Dashboard}
                  title="控制台"
                />
                <Route path="/orders" title="订单">
                  <Route
                    path="/orders"
                    exact
                    // @ts-ignore
                    component={Orders}
                  />
                  <Route path="/orders/:id" component={Order} remountOnChange />
                </Route>
              </Switch>
            </AdminLayout.View>
          </AdminLayout>
        </Title.Provider>
      </HashRouter>
    );
  }
}

const Dashboard = () => {
  return (
    <AdminLayout.Body>
      <h1>Dashboard</h1>
    </AdminLayout.Body>
  );
};

const Orders = () => {
  return (
    <AdminLayout.Body>
      <ul>
        <li>
          <Link to="orders/1">1号</Link>
        </li>
        <li>
          <Link to="orders/2">2号</Link>
        </li>
        <li>
          <Link to="orders/3">3号</Link>
        </li>
      </ul>
    </AdminLayout.Body>
  );
};

class Order extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ""
    };
  }
  componentDidMount() {
    this.setState({
      name: this.props.match.params.id
    });
  }
  render() {
    return (
      <div>
        <BackBar>
          hello world <a>你好</a>
        </BackBar>
        <AdminLayout.Body>
          <Title link=":id">
            <span>
              订单详情-
              {this.state.name}
            </span>
          </Title>
          <h1>{this.state.name}</h1>
          <p>balbalaba</p>
        </AdminLayout.Body>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));