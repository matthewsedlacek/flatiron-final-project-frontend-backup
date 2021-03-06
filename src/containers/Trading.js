import React from "react";
import { api } from "../services/api";
import StockList from "../components/trading/StockList";
import OrderForm from "../components/trading/OrderForm";
import PortfolioInfo from "../components/trading/PortfolioInfo";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

class Trading extends React.Component {
  state = {
    portfolios: [],
    companies: [],
    searchedCompanies: [],
    singlePortfolio: [],
    tradeQuantity: 0,
  };

  componentDidMount() {
    this.fetchPortfolios();
    this.fetchCompanies();
  }

  fetchPortfolios = () => {
    const token = localStorage.getItem("token");
    if (token) {
      api.userData.getPortfolios().then((data) => {
        this.setState({ portfolios: data });
      });
    }
  };

  fetchCompanies = () => {
    const token = localStorage.getItem("token");
    if (token) {
      api.companyData.getCompanies().then((data) => {
        this.setState({ companies: data, searchedCompanies: data });
      });
    }
  };

  handleCompanySelect = (company) => {
    this.setState({
      searchedCompanies: company,
    });
  };

  handlePortfolioSelect = (portfolio) => {
    console.log(portfolio);
    this.setState({
      singlePortfolio: portfolio,
    });
  };

  handleBuyStock = (e) => {
    e.preventDefault();
    let availableCash = this.state.singlePortfolio.available_cash;
    let stock_price = this.state.searchedCompanies.stock_prices[
      this.state.searchedCompanies.stock_prices.length - 1
    ].current_price;
    let quantity = parseInt(this.state.tradeQuantity);
    let tradeValue = stock_price * quantity;
    if (availableCash >= stock_price * quantity) {
      api.userData
        .newBuyTransaction(
          this.state.searchedCompanies.stock_prices,
          this.state.singlePortfolio,
          this.state.tradeQuantity,
          tradeValue
        )
        .then((res) => {
          // this.fetchPortfolios();
          this.buyStock();
          // this.props.history.push("/portfolio");
        });
    } else {
      console.log("Insuffienct Cash Available");
    }
  };

  buyStock = () => {
    let stock_price = this.state.searchedCompanies.stock_prices[
      this.state.searchedCompanies.stock_prices.length - 1
    ].current_price;
    let quantity = parseInt(this.state.tradeQuantity);
    let tradeValue = stock_price * quantity;
    api.userData
      .stockPurchase(this.state.singlePortfolio, tradeValue)
      .then((res) => {
        this.transactedStatus();
        // this.buyStock();
        // this.props.history.push("/portfolio");
      });
  };

  transactedStatus = () => {
    let stock_price = this.state.searchedCompanies.stock_prices[
      this.state.searchedCompanies.stock_prices.length - 1
    ];
    api.stockPrices.updateStockStatus(stock_price).then((res) => {
      this.fetchPortfolios();
      // this.buyStock();
      this.props.history.push("/portfolio");
    });
  };

  handleSellStock = (e) => {
    e.preventDefault();
    // finds all transactions for the company
    let companyId = this.state.searchedCompanies.id;
    let transactionsList = this.state.singlePortfolio.transactions;
    let transactionCompaniesArray = transactionsList.filter(
      (transaction) => transaction.stock_price.company_id === companyId
    );
    //finds all Buy quantities
    let buyTransactions = transactionCompaniesArray.filter(
      (transaction) => transaction.buy_sell === "buy"
    );
    let buyQuantitiesArray = buyTransactions.map(
      (transaction) => transaction.quantity
    );
    let totalBuyQuantities = buyQuantitiesArray.reduce((a, b) => a + b, 0);
    //finds all Sell quantities
    let sellTransactions = transactionCompaniesArray.filter(
      (transaction) => transaction.buy_sell === "sell"
    );
    let sellQuantitiesArray = sellTransactions.map(
      (transaction) => transaction.quantity
    );
    let totalSellQuantities = sellQuantitiesArray.reduce((a, b) => a + b, 0);

    // generates the transaction
    let stock_price = this.state.searchedCompanies.stock_prices[
      this.state.searchedCompanies.stock_prices.length - 1
    ].current_price;
    let quantity = parseInt(this.state.tradeQuantity);
    let tradeValue = stock_price * quantity;
    if (totalBuyQuantities >= totalSellQuantities + quantity) {
      api.userData
        .newSellTransaction(
          this.state.searchedCompanies.stock_prices,
          this.state.singlePortfolio,
          this.state.tradeQuantity,
          tradeValue
        )
        .then((res) => {
          // this.fetchPortfolios();
          this.sellStock();
          // this.props.history.push("/portfolio");
        });
    } else {
      console.log("You do not own specified shares");
    }
  };

  sellStock = () => {
    // finds all transactions for the company
    let companyId = this.state.searchedCompanies.id;
    let transactionsList = this.state.singlePortfolio.transactions;
    let transactionCompaniesArray = transactionsList.filter(
      (transaction) => transaction.stock_price.company_id === companyId
    );
    //finds all Buy quantities
    let buyTransactions = transactionCompaniesArray.filter(
      (transaction) => transaction.buy_sell === "buy"
    );
    let buyQuantitiesArray = buyTransactions.map(
      (transaction) => transaction.quantity
    );
    let totalBuyQuantities = buyQuantitiesArray.reduce((a, b) => a + b, 0);

    let buyValueArray = buyTransactions.map((transaction) => transaction.value);

    let totalBuyValues = buyValueArray.reduce((a, b) => a + b, 0);

    let buyPricePerShare = totalBuyValues / totalBuyQuantities;

    //finds all Sell quantities

    let stock_price = this.state.searchedCompanies.stock_prices[
      this.state.searchedCompanies.stock_prices.length - 1
    ].current_price;

    let gainLoss = stock_price - buyPricePerShare;

    let quantity = parseInt(this.state.tradeQuantity);
    let totalGainLoss = gainLoss * quantity;

    let tradeValue = stock_price * quantity;
    api.userData
      .stockSale(this.state.singlePortfolio, tradeValue, totalGainLoss)
      .then((res) => {
        this.transactedStatus();
        // this.buyStock();
        // this.props.history.push("/portfolio");
      });
  };

  handleQuantityChange = (e) => {
    this.setState({ tradeQuantity: e.target.value });
  };

  render() {
    return (
      <Container style={{ marginTop: 10 }}>
        <Row>
          <Col md={4} className="profileContainer">
            <PortfolioInfo
              portfolios={this.state.portfolios}
              selectPortfolio={this.handlePortfolioSelect}
              singlePortfolio={this.state.singlePortfolio}
            />
          </Col>
          <Col md={{ span: 3, offset: 2 }}>
            <StockList companies={this.state.searchedCompanies} />
          </Col>
        </Row>
        <Row>
          <br></br>
          <br></br>
          <br></br>
        </Row>
        <Row>
          <Col xs={2} md={4} className="profileContainer">
            <OrderForm
              companies={this.state.companies}
              selectCompany={this.handleCompanySelect}
              handleQuantityChange={this.handleQuantityChange}
              handleBuyStock={this.handleBuyStock}
              handleSellStock={this.handleSellStock}
              updatedQuantity={this.state.tradeQuantity}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Trading;
