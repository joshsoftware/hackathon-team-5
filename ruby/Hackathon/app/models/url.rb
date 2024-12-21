class Url < ApplicationRecord
  belongs_to :action, foreign_key: :action_uid, primary_key: :uid, inverse_of: :urls
  has_many :issues, class_name: "Issue", foreign_key: :url_uid, primary_key: :uid, dependent: :destroy
end