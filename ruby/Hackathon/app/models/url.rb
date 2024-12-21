class Url < ApplicationRecord
  belongs_to :action, foreign_key: :action_uid, primary_key: :uid, inverse_of: :urls
  has_many :errors, class_name: "Error", foreign_key: :action_uid, primary_key: :uid, dependent: :destroy
end