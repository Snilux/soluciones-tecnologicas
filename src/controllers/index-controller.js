class indexController {
  async renderIndex(req, res) {
    res.render("index/index");
  }
  
}

export default new indexController();
