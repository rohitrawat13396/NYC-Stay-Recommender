from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
from sklearn.decomposition import PCA
# from pca_component import remove_extra_cols, pca, task2_top3attr, task3_get_MDS_data, get_top3_pca_atttr_data
import numpy as np
import json 

app = Flask(__name__)
  
# Opening JSON file 
f = open('nyc.geo.json',) 
geo_data = json.load(f) 

stratified_sample  =   pd.read_csv('stratified_sampled_data.csv')
grouped_multiple_data  =   pd.read_csv('grouped_multiple_data.csv')

data_for_pca = stratified_sample[["review_scores_rating_zscore","price_zscore","crime_zscore"]]

def do_PCA(data):
    # PCA implementation
    covar_matrix = PCA(n_components = len(data.columns))
    X = pd.DataFrame(covar_matrix.fit_transform(data))
    # Explained variance % per PC
    variance = np.round(covar_matrix.explained_variance_ratio_*100,decimals=2)

    # Cumulative explained variance % per PC
    cumulative_var_percentage = np.round(np.cumsum(np.round(variance,decimals=2)),decimals=2)

    # Get PC1 and PC2 values to plot ahead
    trans_matrix = X[[0,1]]

    return variance,cumulative_var_percentage,trans_matrix

variance,cumulative_var_percentage,trans_matrix = do_PCA(data_for_pca)
trans_matrix["neighbourhood_group"] = stratified_sample["neighbourhood_group"]
trans_matrix.columns = ["PC1","PC2","neighbourhood_group"]
trans_matrix = trans_matrix.reset_index()
stratified_sample = stratified_sample.reset_index()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/geodata")
def get_geodata():
    return geo_data

@app.route("/map")
def get_map_data(): 
    map_data = stratified_sample[["index","neighbourhood_group","longitude", "latitude"]]
    map_data = map_data.to_json(orient = "records")  
    return map_data

@app.route("/pricescatter")
def get_pricescatter_data(): 
    pricescatter_data = stratified_sample[["index","neighbourhood_group","price", "review_scores_rating"]]
    pricescatter_data = pricescatter_data.to_json(orient = "records")  
    return pricescatter_data

@app.route("/pcascatter")
def get_pcascatter_data():  
    pcascatter_data = trans_matrix[["index","neighbourhood_group","PC1", "PC2"]]
    pcascatter_data = pcascatter_data.to_json(orient = "records")  
    return pcascatter_data  
    

@app.route("/barcrime/<zipcodes>",methods = ['GET'])
def get_barcrime_data(zipcodes):    
    print("printing zipcodes")
    json_zipcodes = json.dumps(zipcodes)
    # print(json.loads(zipcodes))
    month_dict = {1:"JAN",2:"FEB",3:"MAR",4:"APR",5:"MAY",6:"JUN",7:"JUL",8:"AUG",9:"SEP",10:"OCT",11:"NOV",12:"DEC"}
    if json_zipcodes == "\"all\"":
        brushed_zipcodes = grouped_multiple_data.zipcodes.unique()
        # brushed_sample = stratified_sample[stratified_sample.index.isin(brushed_zipcodes)]["zipcodes"].unique().astype(np.int32)

        grouped_filtered = grouped_multiple_data.loc[grouped_multiple_data['zipcodes'].isin(brushed_zipcodes)]

        grouped_by_month = grouped_filtered[["CMPLNT_MONTH","CMPLNT_NUM_count"]].groupby("CMPLNT_MONTH").sum().reset_index()

        grouped_by_month = grouped_by_month[grouped_by_month["CMPLNT_MONTH"]>6]

        grouped_by_month["group"] = grouped_by_month["CMPLNT_MONTH"].map(month_dict)
        grouped_by_month["value"] = grouped_by_month["CMPLNT_NUM_count"]

        return grouped_by_month[["group","value"]].to_json(orient="records")
    else:
        json_indexes = json.loads(json_zipcodes)[1:-1]
        
        json_indexes = list(map(int,json_indexes.split(',')))
        brushed_zipcodes = json_indexes
       
        brushed_sample = stratified_sample[stratified_sample.index.isin(brushed_zipcodes)]["zipcodes"].unique().astype(np.int32)

        grouped_filtered = grouped_multiple_data.loc[grouped_multiple_data['zipcodes'].isin(brushed_sample)]

        grouped_by_month = grouped_filtered[["CMPLNT_MONTH","CMPLNT_NUM_count"]].groupby("CMPLNT_MONTH").sum().reset_index()

        grouped_by_month = grouped_by_month[grouped_by_month["CMPLNT_MONTH"]>6]

        grouped_by_month["group"] = grouped_by_month["CMPLNT_MONTH"].map(month_dict)
        grouped_by_month["value"] = grouped_by_month["CMPLNT_NUM_count"]

        return grouped_by_month[["group","value"]].to_json(orient="records")
        # print(stratified_sample.index)
        # print(stratified_sample[json_indexes])
        # df[df.index.isin(my_list)]
    
    # filterdataset =  pd.DataFrame()
    # for zc in brushed_zipcodes:
    #     filterdataset = filterdataset.append(grouped_multiple_data[grouped_multiple_data.zipcodes.eq(zc)])

    # res = {}
    # result = {}
    # months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
    # final_result = []

    # for i in range(1,13):
    #     result[i] = 0

    # for row in filterdataset.iterrows():
    #     if row[1].zipcodes not in res:
    #         res[row[1].zipcodes] = {row[1].CMPLNT_MONTH: row[1].CMPLNT_NUM_count}
    #         result[row[1].CMPLNT_MONTH] =  +row[1].CMPLNT_NUM_count
    #     res[row[1].zipcodes][row[1].CMPLNT_MONTH]= row[1].CMPLNT_NUM_count
    #     result[row[1].CMPLNT_MONTH] +=  row[1].CMPLNT_NUM_count

    # for month,key2 in zip(months,result.keys()):
    #     final_result.append({'group': month, 'value': str(result[key2])})
    # final_result = final_result[6:12]
    # print(final_result)
    # return json.dumps(final_result)