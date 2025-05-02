class ApiFeatures {
    constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
    }
  
    filter() {
      //1 ) Filtering
      const queryObj = { ...this.queryStr };
      const excludedFields = ["page", "sort", "limit", "fields"];
      excludedFields.forEach(el => delete queryObj[el]);
  
      //1 A) Advanced Filtering
      let AdvanceQueryStr = JSON.stringify(queryObj); //Changing the string for Doing Advance Filtering
      AdvanceQueryStr = AdvanceQueryStr.replace(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`
      );
  
      this.query = this.query.find(JSON.parse(AdvanceQueryStr));
  
      //console.log(AdvanceQueryStr);
      //console.log(queryObj)
      //console.log(this.queryStr);
      return this;
    }
  
    sort() {
      if (this.queryStr.sort) {
        let SortBy = this.queryStr.sort.split(",").join(" ");
        this.query = this.query.sort(SortBy);
        //console.log(SortBy);
      } else {
        this.query = this.query.sort("-createdAt");
      }
  
      return this;
    }
  
    limitFields() {
      if (this.queryStr.fields) {
        let fields = this.queryStr.fields.split(",").join(" ");
        this.query = this.query.select(fields); // show only this fields to the Users
      } else {
        this.query = this.query.select("-__v"); //excluding this field thatswhy there is - at the front
      }
  
      return this;
    }
  
     paginate() {
      let page = this.queryStr.page * 1 || 1;
      let limit = this.queryStr.limit * 1 || 100;
      let skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
  
      // if (this.queryStr.page) {
      //   const numTours = await Tour.countDocuments();
      //   if (skip >= numTours) throw new Error("Page Doesnt exist");
      // }
  
      return this;
    }
  }

  module.exports= ApiFeatures;