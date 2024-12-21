class Action < ApplicationRecord
  enum flow: { checkout: 0, listing: 1 }

  has_many :urls, class_name: "Url", foreign_key: :action_uid, primary_key: :uid, dependent: :destroy
  has_many :issues, class_name: "Issue", foreign_key: :action_uid, primary_key: :uid, dependent: :destroy
end