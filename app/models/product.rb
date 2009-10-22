class Product < ActiveRecord::Base
  has_attached_file :image, :default_style => :sized, :styles => { :sized => "630x260!", :thumb => "150x60" }
  has_attached_file :image_thumb, :default_style => :sized, :styles => { :sized => "120x260!", :thumb => "60x60#" }  
end
