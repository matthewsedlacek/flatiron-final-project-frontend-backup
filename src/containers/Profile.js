import React, { Fragment } from "react";
import { api } from "../services/api";
import { Route } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import NewsList from "../components/profile/news/NewsList";
import SearchBar from "../components/profile/watchlist/SearchBar";
import WatchList from "../components/profile/watchlist/WatchList";
import AwardList from "../components/profile/awards/AwardList";

class Profile extends React.Component {
  state = {
    awards: [],
    newsArray: [],
    watchList: [],
    watchListPrices: [],
    companies: [],
    searchedCompanies: [],
    searchedStockPrice: [],
  };

  componentDidMount() {
    this.fetchWatchlist();
    // this.fetchNews();
    this.fetchCompanies();
  }

  fetchNews = () => {
    const token = localStorage.getItem("token");
    if (token) {
      api.marketNews.getNews().then((data) => {
        this.setState({ newsArray: data });
      });
    }
  };

  fetchCompanies = () => {
    const token = localStorage.getItem("token");
    if (token) {
      api.companyData.getCompanies().then((data) => {
        this.setState({ companies: data });
      });
    }
  };

  fetchWatchlist = () => {
    const token = localStorage.getItem("token");
    if (token) {
      api.userData.getWatchList().then((data) => {
        this.setState({ watchList: data });
      });
    }
  };

  handleCompanySelect = (company) => {
    this.setState({
      searchedStockPrice: company.stock_prices[company.stock_prices.length - 1],
      searchedCompanies: company,
    });
  };

  handleWatchListAdd = () => {
    api.userData
      .newWatchListItem(
        this.props.currentUser.id,
        this.state.searchedStockPrice.id
      )
      .then((res) => {
        this.fetchWatchlist();
      });
  };

  handleWatchListRemove = (watchedItem) => {
    console.log(watchedItem);
    api.userData.deleteWatchListItem(watchedItem).then((res) => {
      this.fetchWatchlist();
    });
  };

  render() {
    return (
      <Container>
        <Row>
          <Col md={4} bg="dark">
            <h1>Welcome {this.props.currentUser.username}</h1>{" "}
          </Col>
          <Col md={{ span: 4, offset: 4 }}>
            <SearchBar
              companies={this.state.companies}
              selectCompany={this.handleCompanySelect}
              watchListAdd={this.handleWatchListAdd}
            />
          </Col>
        </Row>
        <Row>
          <br></br>
          <br></br>{" "}
        </Row>
        <Row>
          <Col>
            <h2>Awards</h2>
            <AwardList />
          </Col>
          <Col>
            <h2>Market News</h2>
            <div>
              <NewsList news={this.state.newsArray.data} />
            </div>
          </Col>
          <Col>
            <h2>Watchlist</h2>
            <div>
              <WatchList
                userWatchList={this.state.watchList}
                handleDelete={this.handleWatchListRemove}
              />
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Profile;
