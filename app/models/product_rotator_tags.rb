module ProductRotatorTags
  include Radiant::Taggable

  tag 'products' do |tag|
    tag.expand
  end

  tag 'products:each' do |tag|
    result = []
    Product.find(:all, :order => 'position ASC').each_with_index do |product, index|
      tag.locals.product = product
      tag.locals.index = index
      result << tag.expand
    end
    result
  end

  tag 'products:each:product' do |tag|
    product = tag.locals.product
    index = tag.locals.index
    prev_product = Product.find(:first, :conditions => {:position => product.position.to_i - 1})
    next_product = Product.find(:first, :conditions => {:position => product.position.to_i + 1})
    %{
      <li class='section' id='section_#{index+1}'>#{prev_product ? "<img src=\"#{prev_product.image_thumb.url(:sized)}\" alt=\"#{prev_product.name}\" />#{"<a href='#' onclick=\"my_glider.previous();\"><img src=\"/images/left_arrow.png\" alt='LEFT' /></a>"}" : "<span style='display:inline-block;width:175px;height:260px;'></span>"}<a href="#{product.link}" title="#{product.name}"><img src="#{product.image.url(:sized)}" alt="#{product.image.url(:sized)}" /></a>#{next_product ? "#{"<a href='#' onclick='my_glider.next();'><img src=\"/images/right_arrow.png\" alt='RIGHT' /></a>"}<img src=\"#{next_product.image_thumb.url(:sized)}\" alt='#{next_product.name}' />" : "<span style='display:inline-block;width:175px;height:260px;'></span>"}</li>
    }
  end
end