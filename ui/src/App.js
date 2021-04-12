import React, {Component} from 'react';
//import {Link, Switch, Route, Redirect} from 'react-router-dom';
import {Switch, Route, Redirect} from 'react-router-dom';
import {Container} from 'reactstrap';

import _ from 'lodash';

//-- registries
import serviceRegistry from './lib/ServiceRegistry';
import routeRegistry from './lib/RouteRegistry';
import starredPairs from './lib/StarredPairs';
import standaloneContext from './lib/StandaloneContext';

//-- general views
import Header from './views/Header/';
import Footer from './views/Footer/';
import SideBar from './views/SideBar/';
import DashBoard from './views/DashBoard/';
import TopMenu from './views/TopMenu/';

//-- exchanges views
import Prices from './views/Prices';
import OrderBooks from './views/OrderBooks';
import MyOrders from './views/MyOrders';
import AllMyOrders from './views/AllMyOrders';
import NewOrder from './views/NewOrder';
import MyBalances from './views/MyBalances';

//-- services views
import MarketOverview from './views/MarketOverview';
import Portfolio from './views/Portfolio';
import MarketCap from './views/MarketCap/';
import Settings from './views/Settings';
import MyStreams from './views/MyStreams';
import MyAlerts from './views/MyAlerts/';

class App extends Component {

constructor(props)
{
   super(props);
   this._routes = [];
   this._standaloneRoute = standaloneContext.getRoute();
}

_addExchangeRoutes(obj)
{
    // Prices view
    if (obj.features['tickers'].enabled)
    {
        // pair parameter is optional
        let path = '/exchanges/' + obj.id + '/prices';
        routeRegistry.registerExchangeRoute(path, obj.id, 'prices', true);
        path += '/:pair?';
        path += '/:interval?';
        this._routes.push({
            path:path,
            exact:true,
            component:Prices,
            data:{exchange:obj.id}
        });
    }
    // OrderBooks view
    if (obj.features['orderBooks'].enabled)
    {
        // pair parameter is optional
        let path = '/exchanges/' + obj.id + '/orderBooks';
        routeRegistry.registerExchangeRoute(path, obj.id, 'orderBooks', true);
        path += '/:pair?';
        this._routes.push({
            path:path,
            exact:true,
            component:OrderBooks,
            data:{exchange:obj.id}
        });
    }
    // MyOrders view
    if (obj.features['openOrders'].enabled || obj.features['closedOrders'].enabled)
    {
        let path = '/exchanges/' + obj.id + '/myOrders';
        routeRegistry.registerExchangeRoute(path, obj.id, 'myOrders', true);
        path += '/:pair?';
        this._routes.push({
            path:path,
            exact:true,
            component:MyOrders,
            data:{exchange:obj.id}
        });
    }
    // AllMyOrders view
    if (obj.features['openOrders'].enabled || obj.features['closedOrders'].enabled)
    {
        let path = '/exchanges/' + obj.id + '/allMyOrders';
        routeRegistry.registerExchangeRoute(path, obj.id, 'allMyOrders', true);
        this._routes.push({
            path:path,
            exact:true,
            component:AllMyOrders,
            data:{exchange:obj.id}
        });
    }
    // NewOrder view
    if (obj.features['openOrders'].enabled)
    {
        let path = '/exchanges/' + obj.id + '/newOrder';
        routeRegistry.registerExchangeRoute(path, obj.id, 'newOrder', true);
        path += '/:pair?';
        path += '/:rate?';
        path += '/:quantity?';
        this._routes.push({
            path:path,
            exact:true,
            component:NewOrder,
            data:{exchange:obj.id}
        });
    }
    // MyBalances view
    if (obj.features['balances'].enabled)
    {
        let path = '/exchanges/' + obj.id + '/myBalances';
        routeRegistry.registerExchangeRoute(path, obj.id, 'myBalances');
        this._routes.push({
            path:path,
            exact:true,
            component:MyBalances,
            data:{exchange:obj.id}
        });
    }
}

_loadRoutes()
{
    let self = this;

    //-- exchanges
    let exchanges = serviceRegistry.getExchanges();
    let exchangesWithBalancesSupport = [];
    let exchangesWithStreamsSupport = [];
    if (0 != Object.keys(exchanges))
    {
        _.forEach(exchanges, function(obj){
            if (obj.features.balances.enabled)
            {
                exchangesWithBalancesSupport.push(obj.id);
            }
            if (obj.features.wsTickers.enabled || obj.features.wsOrderBooks.enabled || obj.features.wsTrades.enabled)
            {
                exchangesWithStreamsSupport.push(obj.id);
            }
            self._addExchangeRoutes(obj);
        });
    }

    //-- services
    let services = serviceRegistry.getServices();
    // MarketCap service
    if (undefined !== services['marketCap'])
    {
        let path = '/services/marketCap';
        routeRegistry.registerServiceRoute(path, 'marketCap');
        path += '/:symbol?';
        this._routes.push({
            path:path,
            exact:true,
            component:MarketCap
        });
    }

    //-- remaining routes
    let path;

    // Portfolio requires marketCap & support for 'balances' features in exchanges
    if (undefined !== services['marketCap'] && 0 != exchangesWithBalancesSupport.length)
    {
        path = '/services/portfolio';
        routeRegistry.registerRoute(path, 'portfolio', true);
        this._routes.push({
            path:path,
            exact:true,
            component:Portfolio
        });
    }

    // Market Overview & Settings (requires local storage)
    if (window.ctx.hasLocalStorage)
    {
        path = '/services/marketOverview';
        routeRegistry.registerRoute(path, 'marketoverview', true);
        this._routes.push({
            path:path,
            exact:true,
            component:MarketOverview
        });

        path = '/services/settings';
        routeRegistry.registerRoute(path, 'settings', true);
        this._routes.push({
            path:path,
            exact:true,
            component:Settings
        });
    }

    // myStreams route
    if (0 !== exchangesWithStreamsSupport.length)
    {
        path = '/services/myStreams';
        routeRegistry.registerRoute(path, 'myStreams', true);
        this._routes.push({
            path:path,
            exact:true,
            component:MyStreams
        });
    }

    // alerts route
    if (undefined !== services['tickerMonitor'])
    {
        let path = '/services/myAlerts';
        routeRegistry.registerRoute(path, 'myAlerts', true);
        path += '/:alertId?';
        this._routes.push({
            path:path,
            exact:true,
            component:MyAlerts
        });
    }

    //-- home route
    path = '/home';
    routeRegistry.registerRoute(path, 'home');
    this._routes.push({
        path:path,
        exact:true,
        component:DashBoard
    });

    //-- default route (use marketOverview if user has starred pairs, otherwise home)
    const defautRoute = {
        redirect:this._standaloneRoute
    }
    if (undefined === defautRoute.redirect)
    {
        defautRoute.redirect = '/home';
        if (0 != starredPairs.size())
        {
            defautRoute.redirect = '/services/marketOverview';
        }
    }
    this._routes.push(defautRoute);
    /*
    if (0 != starredPairs.size())
    {
        path = '/';
        routeRegistry.registerRoute(path, 'marketoverview', true);
        this._routes.push({
            path:path,
            exact:false,
            component:MarketOverview
        });
    }
    else
    {
        path = '/';
        routeRegistry.registerRoute(path, 'home');
        this._routes.push({
            path:path,
            exact:false,
            component:DashBoard
        });
    }
    */
}

componentWillMount()
{
    this._loadRoutes();
}

componentDidMount()
{
}

render()
{
    const routes = this._routes;
    const route = (item, index) => {
        if (undefined !== item.redirect)
        {
            return (
                <Route key="default" exact={true} path="/">
                    <Redirect to={item.redirect}/>
                </Route>
            );
        }
        // no extra properties to path
        if (undefined === item.data)
        {
            return (
                <Route key={index} exact={item.exact} path={item.path} component={item.component}/>
            );
        }
        return (
            <Route key={index} exact={item.exact} path={item.path} render={(props) => (
                <item.component {...props} data={item.data}/>
            )}/>
        );
    };

    const routeList = () => {
        return this._routes.map( (r, index) => route(r, index) );
    };

    return (
      <div className="app">
        <Header />
        <div className="app-body">
          <SideBar {...this.props}/>
          <main className="main" style={{overflow:'hidden'}}>
            <TopMenu {...this.props}/>
            <Container fluid>
              <Switch>
              {routeList()}
              </Switch>
            </Container>
          </main>
        </div>
        <Footer />
      </div>
    );
}

}

export default App;
